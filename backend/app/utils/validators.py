import re
from email_validator import validate_email, EmailNotValidError

def validate_email_format(email: str) -> bool:
    """Validate email format"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        return False

def validate_password_strength(password: str) -> dict:
    """
    Validate password strength
    Returns a dict with 'valid' (bool) and 'message' (str) keys
    """
    if len(password) < 8:
        return {
            'valid': False,
            'message': 'Password must be at least 8 characters long'
        }
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one digit'
        }
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one uppercase letter'
        }
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one lowercase letter'
        }
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one special character'
        }
    
    return {
        'valid': True,
        'message': 'Password is strong'
    }