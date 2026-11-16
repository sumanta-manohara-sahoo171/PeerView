from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.signing import Signer, BadSignature # Used for stateless password resets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token # Used for API Keys

# Initialize the signer for stateless forgot-password flow
signer = Signer()

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists!"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Must use create_user to properly hash passwords
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login_(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        # Get or create an API Key (Token) for the user
        token, created = Token.objects.get_or_create(user=user)
        is_admin = bool(user.is_staff or user.is_superuser)
        
        return Response({
            "message": "Logged in successfully!",
            "api_key": token.key, # Send the API key to the frontend!
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "role": "admin" if is_admin else "user"
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid username or password!"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def logout_(request):
    # Delete the user's API Key to log them out
    request.user.auth_token.delete()
    return Response({"message": "Logged out successfully!"}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def reset_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    user = authenticate(request, username=request.user.username, password=old_password)
    
    if user is not None:
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Incorrect old password!"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def forgot(request):
    username = request.data.get('username')
    try:
        user = User.objects.get(username=username)
        # Create a secure, signed token containing the username (no sessions needed)
        reset_token = signer.sign(user.username)
        
        return Response({
            "message": "User found. Proceed to enter new password.",
            "reset_token": reset_token # Frontend must save this and send it back in step 2
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({"error": "Username doesn't exist!"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def new_password(request):
    reset_token = request.data.get('reset_token')
    new_pass = request.data.get('new_password')
    
    if not reset_token or not new_pass:
        return Response({"error": "Missing token or password."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Unsign the token to securely get the username back
        username = signer.unsign(reset_token)
        user = User.objects.get(username=username)
        
        if user.check_password(new_pass):
            return Response({"error": "New password can't be same as old password!"}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_pass)
        user.save()
        return Response({"message": "Password successfully reset!"}, status=status.HTTP_200_OK)
        
    except BadSignature:
        return Response({"error": "Invalid or tampered reset token!"}, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist:
        return Response({"error": "User no longer exists!"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])        
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    
    user.first_name = request.data.get("first_name", user.first_name)
    user.last_name = request.data.get("last_name", user.last_name)
    user.email = request.data.get("email", user.email)
    user.save()
    
    is_admin = bool(user.is_staff or user.is_superuser)
    
    return Response({
        "message": "Profile updated successfully!", 
        "user": {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "role": "admin" if is_admin else "user"
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def get_profile(request):
    user = request.user
    is_admin = bool(user.is_staff or user.is_superuser)
    
    return Response({
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "role": "admin" if is_admin else "user"
    }, status=status.HTTP_200_OK)