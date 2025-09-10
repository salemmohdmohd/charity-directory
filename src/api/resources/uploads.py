from flask import send_from_directory, current_app
from flask_restx import Resource
from ..core import api
import os

uploads_ns = api.namespace('uploads', description='Serve uploaded files')

@uploads_ns.route('/<path:filename>')
class ServeUpload(Resource):
    @uploads_ns.doc(responses={
        200: 'File served successfully',
        404: 'File not found'
    })
    def get(self, filename):
        """Serves a file from the upload directory."""
        upload_dir = current_app.config['UPLOAD_FOLDER']
        return send_from_directory(upload_dir, filename)
