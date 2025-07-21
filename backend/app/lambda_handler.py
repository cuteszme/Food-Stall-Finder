from mangum import Mangum
from app.main import app

# Handler for AWS Lambda
handler = Mangum(app)