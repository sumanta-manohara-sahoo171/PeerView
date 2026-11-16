from django.db import models
from django.contrib.auth.models import User

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    file = models.FileField(upload_to='uploads/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # We don't need to store upvotes/downvotes directly as integers; 
    # we can calculate them dynamically from the Vote table!

    def __str__(self):
        return f"Post {self.id} by {self.author.username}"

class Vote(models.Model):
    # Enforce choices: 1 for Upvote, -1 for Downvote
    VOTE_CHOICES = (
        (1, 'Upvote'),
        (-1, 'Downvote'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.IntegerField(choices=VOTE_CHOICES)

    class Meta:
        # A user can only vote once per post (they can update it, but not have two votes)
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} voted {self.vote_type} on Post {self.post.id}"

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    is_reported = models.BooleanField(default=False) # Used for the Admin moderation queue
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"