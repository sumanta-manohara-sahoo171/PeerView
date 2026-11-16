from rest_framework import serializers
from .models import Post, Comment, Vote

class PostSerializer(serializers.ModelSerializer):
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    upvotes = serializers.SerializerMethodField()
    downvotes = serializers.SerializerMethodField()
    file_path = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'author_id', 'content', 'file_path', 'upvotes', 'downvotes', 'created_at']

    def get_upvotes(self, obj):
        return obj.votes.filter(vote_type=1).count()

    def get_downvotes(self, obj):
        return obj.votes.filter(vote_type=-1).count()

    def get_file_path(self, obj):
        if obj.file:
            return obj.file.url
        return None

class CommentSerializer(serializers.ModelSerializer):
    author_display = serializers.CharField(source='author.username', read_only=True)
    real_author = serializers.CharField(source='author.username', read_only=True) 
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post_id', 'author_display', 'real_author', 'content', 'is_mine', 'created_at']

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False