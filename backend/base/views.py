from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Vote
from .serializer import PostSerializer, CommentSerializer

# ==========================================
# POST ENDPOINTS
# ==========================================
@api_view(['GET', 'POST'])
def post_list(request):
    if request.method == 'GET':
        search_query = request.GET.get('q', '')
        page_num = request.GET.get('page', 1)
        
        posts = Post.objects.all().order_by('-created_at')
        
        if search_query:
            posts = posts.filter(content__icontains=search_query)
        
        paginator = Paginator(posts, 5)
        page_obj = paginator.get_page(page_num)
        
        serializer = PostSerializer(page_obj, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({"message": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response({"message": "Post created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):
    posts = Post.objects.filter(author=request.user).order_by('-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({"message": "Post not found"}, status=status.HTTP_404_NOT_FOUND)
        
    if request.user == post.author or request.user.is_staff:
        post.delete()
        return Response({"message": "Post deleted!"}, status=status.HTTP_200_OK)
    
    return Response({"message": "You don't have permission to delete this."}, status=status.HTTP_403_FORBIDDEN)

# ==========================================
# VOTING ENDPOINT
# ==========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cast_vote(request):
    post_id = request.data.get('post_id')
    vote_type = request.data.get('vote_type')
    post = get_object_or_404(Post, id=post_id)
    
    vote, created = Vote.objects.update_or_create(
        user=request.user,
        post=post,
        defaults={'vote_type': vote_type}
    )
    return Response({"message": "Vote recorded successfully!"}, status=status.HTTP_200_OK)

# ==========================================
# COMMENTS ENDPOINTS
# ==========================================
@api_view(['GET'])
def get_comments(request, post_id):
    comments = Comment.objects.filter(post_id=post_id).order_by('created_at')
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_comment(request):
    post_id = request.data.get('post_id')
    content = request.data.get('content')
    post = get_object_or_404(Post, id=post_id)
    
    Comment.objects.create(author=request.user, post=post, content=content)
    return Response({"message": "Review added successfully!"}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    
    if request.user == comment.author or request.user == comment.post.author or request.user.is_staff:
        comment.delete()
        return Response({"message": "Review deleted"}, status=status.HTTP_200_OK)
        
    return Response({"message": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

# ==========================================
# ADMIN MODERATION ENDPOINTS
# ==========================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_comment(request, comment_id):
    comment = get_object_or_404(Comment, id=comment_id)
    comment.is_reported = True
    comment.save()
    return Response({"message": "Review reported to administrators. Thank you."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reported_comments(request):
    if not request.user.is_staff:
        return Response({"message": "Admins only"}, status=status.HTTP_403_FORBIDDEN)
        
    comments = Comment.objects.filter(is_reported=True)
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dismiss_report(request, comment_id):
    if not request.user.is_staff:
        return Response({"message": "Admins only"}, status=status.HTTP_403_FORBIDDEN)
        
    comment = get_object_or_404(Comment, id=comment_id)
    comment.is_reported = False
    comment.save()
    return Response({"message": "Report dismissed"}, status=status.HTTP_200_OK)
