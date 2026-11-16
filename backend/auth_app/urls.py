from django.urls import path
from . import views

urlpatterns = [
    # Authentication & Registration
    path('register/', views.register, name='register'),
    path('login/', views.login_, name='login'),
    path('logout/', views.logout_, name='logout'),
    
    # Password Management
    path('reset-password/', views.reset_password, name='reset_password'), # Logged in users
    path('forgot/', views.forgot, name='forgot'),                         # Forgot password step 1
    path('new-password/', views.new_password, name='new_password'),       # Forgot password step 2
    
    # Profile Management
    path('profile/', views.get_profile, name='get_profile'),              # Fetch logged-in user profile
    path('update-profile/', views.update_profile, name='update_profile'), # Update profile details
]