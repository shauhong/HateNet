import re
from flask import current_app
from datetime import datetime
import os

from HateNet.database.schema import Project
from HateNet.models.inference import detect_text, detect_multimodal, detect_projects
from HateNet.utils.aggregate import aggregate_project, aggregate_projects
from HateNet.utils.file import load_yaml
from HateNet.utils.twitter import add_filtered_stream, add_volume_stream, delete_all_rules, delete_rules, get_filtered_stream, get_rules, get_volume_stream, remove_filtered_stream, remove_volume_stream, retrieve_filtered_stream_tweets, retrieve_historical_tweets, retrieve_monitor_projects, retrieve_monitor_tweets, retrieve_personal_projects, retrieve_personal_tweets, retrieve_volume_stream_tweets, set_rules
from HateNet.utils.wrappers import bearer_token_required, params_required


def schedule_detect_text(scheduler, project, id, minutes=15):
    scheduler.add_job(detect_text, 'interval', minutes=minutes, args=[
                      project, current_app.models['BERTweet'], current_app.device], id=id)


def schedule_detect_multimodal(scheduler, project, id, minutes=15):
    scheduler.add_job(detect_multimodal, 'interval', minutes=minutes, args=[
                      project, current_app.models['VisualBERT'], current_app.device], id=id)


def schedule_aggregate(scheduler, project, id, minutes=15):
    scheduler.add_job(aggregate_project, 'interval', minutes=minutes, args=[
                      project], id=id)


def schedule_volume_stream(scheduler, project, id, schedule=False):
    params = load_yaml(os.path.join("static", "params.yaml"))
    now = datetime.now()
    if schedule:
        if now < project.end_date:
            if now > project.start_date:
                scheduler.add_job(get_volume_stream, 'date', args=[
                                  project, params], kwargs={'schedule': schedule}, id=id)
            else:
                scheduler.add_job(get_volume_stream, 'date', run_date=project.start_date, args=[
                                  project, params], kwargs={'schedule': schedule}, id=id)
    else:
        scheduler.add_job(get_volume_stream, 'date', args=[
                          project, params], kwargs={'schedule': schedule}, id=id)


def schedule_filtered_stream(scheduler, project, id, schedule=False):
    params = load_yaml(os.path.join("static", "params.yaml"))
    now = datetime.now()
    rules = get_rules()
    if 'data' in rules:
        delete_rules(rules, tag=id)
    set_rules(project.query, tag=id)
    if schedule:
        if now < project.end_date:
            if now > project.start_date:
                scheduler.add_job(get_filtered_stream, 'date', args=[
                                  project, id, params], kwargs={'schedule': schedule}, id=id)
            else:
                scheduler.add_job(get_filtered_stream, 'date', run_date=project.start_date, args=[
                                  project, id, params], kwargs={'schedule': schedule}, id=id)
    else:
        scheduler.add_job(get_filtered_stream, 'date', args=[
                          project, id, params], kwargs={'schedule': schedule}, id=id)


def schedule_personal_tweets(scheduler, project, id, minutes=15):
    params = load_yaml(os.path.join("static", "params.yaml"))
    scheduler.add_job(retrieve_personal_tweets, 'interval', minutes=minutes, args=[
                      project.user.twitter_id, project, params], id=id)


def schedule_historical_tweets(scheduler, project, id, minutes=15):
    params = load_yaml(os.path.join("static", "params.yaml"))
    scheduler.add_job(retrieve_historical_tweets, 'interval', minutes=minutes, args=[
                      project.query, project, params], id=id)


def schedule_monitor_tweets(scheduler, project, id, minutes=15):
    params = load_yaml(os.path.join("static", "params.yaml"))
    scheduler.add_job(retrieve_monitor_tweets, 'interval',
                      minutes=minutes, args=[project, params], id=id)


def remove_from_schedule(scheduler, id):
    if id in [job.id for job in scheduler.get_jobs()]:
        scheduler.remove_job(id)


def get_jobs_id(project):
    agg_id = f"aggregate_{project.name}"
    mon_id = f"monitor_{project.name}"
    sch_id = f"{project.user.username}_{project.name}"
    return {
        'aggregate': agg_id,
        'monitor': mon_id,
        'schedule': sch_id
    }


@bearer_token_required
@params_required
def init_schedule(scheduler, app, params, headers):
    reset(scheduler)

    # schedule_personal_projects(scheduler, params, headers)
    # schedule_monitor_projects(scheduler, params, headers)
    # schedule_historical_projects(scheduler, params, headers)
    # schedule_volume_projects(scheduler, params, headers)
    # schedule_filtered_projects(scheduler, params, headers)
    # with app.app_context():
    #     schedule_detect_projects(scheduler)
    # schedule_aggregate_projects(scheduler)


def reset(scheduler):
    Project.objects.update(streaming=False)
    for job in scheduler.get_jobs():
        scheduler.remove_job(job.id)


@bearer_token_required
@params_required
def schedule_project(scheduler, project, params=None, headers=None):
    if project.project_type == 'personal':
        schedule_personal_project(scheduler, project, params, headers)
    if project.project_type == 'historical':
        schedule_historical_project(scheduler, project, params, headers)
    if project.project_type == 'volume':
        schedule_volume_project(scheduler, project, params, headers)
    if project.project_type == 'filtered':
        schedule_filtered_project(scheduler, project, params, headers)


def schedule_monitor(scheduler, project, params, headers):
    id = f"{project.user.username}-{project.name}-monitor"
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(retrieve_monitor_tweets, 'interval', days=1,
                      next_run_time=datetime.now(), args=[project, params, headers], id=id)


def schedule_personal_projects(scheduler, params, headers):
    id = "personal"
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(retrieve_personal_projects, 'interval', hours=1,
                      next_run_time=datetime.now(),  misfire_grace_time=300, args=[params, headers], id=id)


def schedule_monitor_projects(scheduler, params, headers):
    id = "monitor"
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(retrieve_monitor_projects, 'interval', hours=1,
                      next_run_time=datetime.now(), misfire_grace_time=300, args=[params, headers], id=id)


def schedule_personal_project(scheduler, project, params, headers):
    id = f"{project.user.username}-{project.name}"
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(retrieve_personal_tweets, 'date', args=[
                      project.user.twitter_username, project, params, headers], id=id)


def schedule_historical_projects(scheduler, params, headers):
    projects = Project.objects(project_type="historical")
    for project in projects:
        schedule_historical_project(scheduler, project, params, headers)


def schedule_historical_project(scheduler, project, params, headers):
    project_id = f"{project.user.username}-{project.name}"
    start_id = f"{project.user.username}-{project.name}-start"
    end_id = f"{project.user.username}-{project.name}-end"
    ids = [job.id for job in scheduler.get_jobs()]
    update_project(project, streaming=False)

    for id in [project_id, start_id, end_id]:
        if id in ids:
            scheduler.remove_job(id)

    now = datetime.now()
    if project.start and project.end:
        if now < project.end:
            if now > project.start:
                scheduler.add_job(update_project, 'date', kwargs={
                                  'project': project, 'streaming': True}, id=start_id)
                scheduler.add_job(update_project, 'date', run_date=project.end, kwargs={
                                  'project': project, 'streaming': False}, id=end_id)
                scheduler.add_job(retrieve_historical_tweets, 'date', args=[
                    project, params, headers], id=project_id)

            else:
                scheduler.add_job(update_project, 'date', run_date=project.start, kwargs={
                                  'project': project, 'streaming': True}, id=start_id)
                scheduler.add_job(update_project, 'date', run_date=project.end, kwargs={
                                  'project': project, 'streaming': False}, id=end_id)
                scheduler.add_job(retrieve_historical_tweets, 'date', run_date=project.start, args=[
                    project, params, headers], id=project_id)


def schedule_volume_projects(scheduler, params, headers):
    projects = Project.objects(project_type="volume")
    for project in projects:
        schedule_volume_project(scheduler, project, params, headers)


def schedule_volume_project(scheduler, project, params, headers):
    project_id = f"{project.user.username}-{project.name}"
    start_id = f"{project.user.username}-{project.name}-start"
    end_id = f"{project.user.username}-{project.name}-end"
    ids = [job.id for job in scheduler.get_jobs()]
    remove_volume_stream(project)

    for id in [project_id, start_id, end_id]:
        if id in ids:
            scheduler.remove_job(id)

    now = datetime.now()

    if project.start and project.end:
        if now < project.end:
            if now > project.start:
                scheduler.add_job(add_volume_stream, 'date', args=[
                                  project, params, headers],  misfire_grace_time=300, id=project_id)
                scheduler.add_job(remove_volume_stream, 'date',
                                  run_date=project.end, args=[project],  misfire_grace_time=300, id=end_id)
            else:
                scheduler.add_job(add_volume_stream, 'date', run_date=project.start, args=[
                                  project, params, headers],  misfire_grace_time=300, id=project_id)
                scheduler.add_job(remove_volume_stream, 'date',
                                  run_date=project.end, args=[project],  misfire_grace_time=300, id=end_id)


def schedule_filtered_projects(scheduler, params, headers):
    projects = Project.objects(project_type="filtered")
    delete_all_rules(headers)
    for project in projects:
        schedule_filtered_project(scheduler, project, params, headers)


def schedule_filtered_project(scheduler, project, params, headers):
    project_id = f"{project.user.username}-{project.name}"
    start_id = f"{project.user.username}-{project.name}-start"
    end_id = f"{project.user.username}-{project.name}-end"
    ids = [job.id for job in scheduler.get_jobs()]
    remove_filtered_stream(project, headers)

    for id in [project_id, start_id, end_id]:
        if id in ids:
            scheduler.remove_job(id)

    now = datetime.now()

    if project.start and project.end:
        if now < project.end:
            if now > project.start:
                scheduler.add_job(add_filtered_stream, 'date', args=[
                                  project, params, headers],  misfire_grace_time=300, id=project_id)
                scheduler.add_job(remove_filtered_stream, 'date', run_date=project.end, args=[
                                  project, headers],  misfire_grace_time=300, id=end_id)
            else:
                scheduler.add_job(add_filtered_stream, 'date', run_date=project.start, args=[
                                  project, params, headers],  misfire_grace_time=300, id=project_id)
                scheduler.add_job(remove_filtered_stream, 'date', run_date=project.end, args=[
                                  project, headers],  misfire_grace_time=300, id=end_id)


def schedule_aggregate_projects(scheduler):
    id = 'aggregate'
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(aggregate_projects, 'interval', hours=1,
                      next_run_time=datetime.now(), misfire_grace_time=300, id=id)


def schedule_aggregate_project(scheduler, project):
    id = f"{project.user.username}-{project.name}-aggregate"
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(aggregate_project, 'interval', days=1,
                      next_run_time=datetime.now(),  misfire_grace_time=300, args=[project], id=id)


def schedule_detect_projects(scheduler):
    print("Schedule Detect Projects")
    id = 'detect'
    ids = [job.id for job in scheduler.get_jobs()]
    if id in ids:
        scheduler.remove_job(id)
    scheduler.add_job(detect_projects, 'interval', days=1,
                      next_run_time=datetime.now(), misfire_grace_time=300, id=id, args=[current_app.models])
    #

# def schedule_detect_text(scheduler, project, id, minutes=15):
#     scheduler.add_job(detect_text, 'interval', minutes=minutes, args=[
#                       project, current_app.models['BERTweet'], current_app.device], id=id)


def update_project(project, **kwargs):
    Project.objects(id=project.id).update_one(**kwargs)


@bearer_token_required
def remove_from_schedule(scheduler, project, headers):
    pattern = f"{project.user.username}-{project.name}"
    ids = [job.id for job in scheduler.get_jobs()]
    if project.project_type == 'filtered':
        remove_filtered_stream(project, headers)
    elif project.project_type == 'volume':
        remove_volume_stream(project)
    else:
        update_project(project, streaming=False)
    for id in ids:
        if re.match(pattern, id):
            scheduler.remove_job(id)
