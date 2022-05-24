def init(app):
    from . import auth, block, data, healthcheck, inference, project, report
    app.register_blueprint(auth.bp)
    app.register_blueprint(block.bp)
    app.register_blueprint(data.bp)
    app.register_blueprint(healthcheck.bp)
    app.register_blueprint(inference.bp)
    app.register_blueprint(project.bp)
    app.register_blueprint(report.bp)
