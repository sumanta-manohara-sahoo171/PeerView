from django.urls import path
from . import views

urlpatterns = [
    # Posts
    path('posts/', views.post_list, name='post_list'),
    path('posts/me/', views.my_posts, name='my_posts'),
    path('posts/<int:pk>/', views.delete_post, name='delete_post'),

    # Votes
    path('interactions/votes/', views.cast_vote, name='cast_vote'),

    # Comments
    path('interactions/posts/<int:post_id>/comments/', views.get_comments, name='get_comments'),
    path('interactions/comments/', views.post_comment, name='post_comment'),
    path('interactions/comments/<int:comment_id>/', views.delete_comment, name='delete_comment'),

    # Admin & Moderation
    path('interactions/comments/<int:comment_id>/report/', views.report_comment, name='report_comment'),
    path('interactions/comments/reported/', views.reported_comments, name='reported_comments'),
    path('interactions/comments/<int:comment_id>/dismiss/', views.dismiss_report, name='dismiss_report'),
]