from apscheduler.schedulers.background import BackgroundScheduler


def init(app):
    from .schedule import init_schedule
    app.scheduler = BackgroundScheduler({
        'apscheduler.timezone': "Asia/Kuala_Lumpur"
    })
    app.scheduler.start()
    init_schedule(app.scheduler)
