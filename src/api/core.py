from flask_restx import Api

# Initialize API with Swagger documentation
# This is done in a separate file to avoid circular imports
api = Api(
    version='1.0',
    title='Charity Directory API',
    description='A comprehensive API for managing charity organizations',
    doc='/docs/',
    validate=True
)
