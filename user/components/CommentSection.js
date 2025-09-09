import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Default, Fonts } from '../constants/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useListComments } from '../hooks/useListComments';
import { useCreateComment } from '../hooks/useCreateComment';
import { useUpdateCommentLikes } from '../hooks/useUpdateCommentLikes';

const CommentSection = ({ noticeId, userProfile }) => {
  const { t, i18n } = useTranslation();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  
  const isRtl = i18n.dir() === 'rtl';
  
  const { data: comments = [], isLoading, error } = useListComments(noticeId);
  const createCommentMutation = useCreateComment();
  const updateLikesMutation = useUpdateCommentLikes();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    const commentData = {
      notice_id: noticeId,
      author_name: userProfile?.first_name ? 
        `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() : 
        'Anonymous User',
      author_avatar: userProfile?.avatar_url || null,
      content: newComment.trim(),
      parent_id: replyingTo?.id || null,
      likes_count: 0,
    };

    try {
      await createCommentMutation.mutateAsync(commentData);
      setNewComment('');
      setReplyingTo(null);
      setShowReplyInput(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    }
  };

  const handleLikeComment = async (comment) => {
    try {
      await updateLikesMutation.mutateAsync({
        id: comment.id,
        likesCount: comment.likes_count + 1,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to like comment. Please try again.');
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setShowReplyInput(true);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderComment = ({ item: comment }) => {
    const isReply = !!comment.parent_id;
    
    return (
      <View
        style={{
          marginBottom: Default.fixPadding * 1.5,
          marginLeft: isReply ? Default.fixPadding * 3 : 0,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 12,
            padding: Default.fixPadding * 1.5,
            borderLeftWidth: isReply ? 3 : 0,
            borderLeftColor: isReply ? Colors.primary : 'transparent',
            ...Default.shadow,
            elevation: 2,
          }}
        >
          {/* Comment Header */}
          <View
            style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: Default.fixPadding * 0.8,
            }}
          >
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: Colors.lightGrey,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: isRtl ? 0 : Default.fixPadding * 0.8,
                  marginLeft: isRtl ? Default.fixPadding * 0.8 : 0,
                }}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color={Colors.grey}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...Fonts.SemiBold14black }}>
                  {comment.author_name}
                </Text>
                <Text style={{ ...Fonts.Medium12grey }}>
                  {formatTimeAgo(comment.created_at)}
                </Text>
              </View>
            </View>
          </View>

          {/* Comment Content */}
          <Text
            style={{
              ...Fonts.Medium14black,
              lineHeight: 20,
              marginBottom: Default.fixPadding,
            }}
          >
            {comment.content}
          </Text>

          {/* Comment Actions */}
          <View
            style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  flexDirection: isRtl ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  paddingVertical: Default.fixPadding * 0.5,
                  paddingHorizontal: Default.fixPadding * 0.8,
                  marginRight: isRtl ? 0 : Default.fixPadding,
                  marginLeft: isRtl ? Default.fixPadding : 0,
                }}
                onPress={() => handleLikeComment(comment)}
              >
                <MaterialCommunityIcons
                  name="thumb-up-outline"
                  size={16}
                  color={Colors.grey}
                />
                <Text style={{ ...Fonts.Medium12grey, marginHorizontal: 4 }}>
                  {comment.likes_count}
                </Text>
              </TouchableOpacity>

              {!isReply && (
                <TouchableOpacity
                  style={{
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    paddingVertical: Default.fixPadding * 0.5,
                    paddingHorizontal: Default.fixPadding * 0.8,
                  }}
                  onPress={() => handleReply(comment)}
                >
                  <MaterialCommunityIcons
                    name="reply-outline"
                    size={16}
                    color={Colors.grey}
                  />
                  <Text style={{ ...Fonts.Medium12grey, marginHorizontal: 4 }}>
                    Reply
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCommentInput = () => (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: Default.fixPadding * 1.5,
        ...Default.shadow,
        elevation: 3,
        marginTop: Default.fixPadding * 2,
      }}
    >
      {replyingTo && (
        <View
          style={{
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            marginBottom: Default.fixPadding,
            paddingVertical: Default.fixPadding * 0.5,
            paddingHorizontal: Default.fixPadding,
            backgroundColor: Colors.lightGrey,
            borderRadius: 8,
          }}
        >
          <MaterialCommunityIcons
            name="reply"
            size={16}
            color={Colors.grey}
          />
          <Text style={{ ...Fonts.Medium12grey, marginHorizontal: 8, flex: 1 }}>
            Replying to {replyingTo.author_name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setReplyingTo(null);
              setShowReplyInput(false);
            }}
          >
            <MaterialCommunityIcons
              name="close"
              size={16}
              color={Colors.grey}
            />
          </TouchableOpacity>
        </View>
      )}
      
      <View
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: Colors.lightGrey,
            borderRadius: 8,
            paddingHorizontal: Default.fixPadding,
            paddingVertical: Default.fixPadding * 0.8,
            maxHeight: 100,
            ...Fonts.Medium14black,
            textAlignVertical: 'top',
          }}
          placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          textAlign={isRtl ? 'right' : 'left'}
        />
        <TouchableOpacity
          style={{
            backgroundColor: Colors.primary,
            borderRadius: 8,
            padding: Default.fixPadding * 0.8,
            marginLeft: isRtl ? 0 : Default.fixPadding * 0.8,
            marginRight: isRtl ? Default.fixPadding * 0.8 : 0,
          }}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || createCommentMutation.isLoading}
        >
          <MaterialCommunityIcons
            name="send"
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ padding: Default.fixPadding * 2 }}>
        <Text style={{ ...Fonts.Medium14grey, textAlign: 'center' }}>
          Loading comments...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: Default.fixPadding * 2 }}>
        <Text style={{ ...Fonts.Medium14grey, textAlign: 'center' }}>
          Failed to load comments
        </Text>
      </View>
    );
  }

  // Group comments by parent/child relationship
  const mainComments = comments.filter(comment => !comment.parent_id);
  const replies = comments.filter(comment => comment.parent_id);
  
  const commentsWithReplies = mainComments.map(comment => ({
    ...comment,
    replies: replies.filter(reply => reply.parent_id === comment.id)
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View
        style={{
          marginTop: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        {/* Comments Header */}
        <View
          style={{
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            marginBottom: Default.fixPadding * 1.5,
          }}
        >
          <MaterialCommunityIcons
            name="comment-multiple-outline"
            size={24}
            color={Colors.primary}
          />
          <Text
            style={{
              ...Fonts.SemiBold18black,
              marginHorizontal: Default.fixPadding * 0.8,
              letterSpacing: 0.2,
            }}
          >
            Comments ({comments.length})
          </Text>
        </View>

        {/* Comments List */}
        {commentsWithReplies.length > 0 ? (
          <View>
            {commentsWithReplies.map((item) => (
              <View key={item.id}>
                {renderComment({ item })}
                {item.replies.map((reply) => (
                  <View key={reply.id}>
                    {renderComment({ item: reply })}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: Default.fixPadding * 2,
            }}
          >
            <MaterialCommunityIcons
              name="comment-outline"
              size={48}
              color={Colors.lightGrey}
            />
            <Text
              style={{
                ...Fonts.Medium14grey,
                marginTop: Default.fixPadding,
                textAlign: 'center',
              }}
            >
              No comments yet. Be the first to comment!
            </Text>
          </View>
        )}

        {/* Comment Input */}
        {renderCommentInput()}
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentSection;
