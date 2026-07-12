import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Heart, MessageCircle, Send, ShieldCheck, Share2, MoreVertical, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeaderBrand } from './Shared.jsx';
import { getInitialTickets } from './data.js';

const FEED_STORAGE_KEY = 'ps_crm_visual_feed_v1';
const MAX_COMMENT_LENGTH = 180;
const MAX_VISIBLE_COMMENTS = 5;

const FALLBACK_POSTS = [
  {
    postId: 'demo-1',
    ticketId: 'GN-DEMO-001',
    citizenName: 'Aman Verma',
    location: 'Sector 36, Main Road',
    category: 'Roads & Potholes',
    description: 'Critical pothole hazard with standing water. Safety risk for vehicles and cyclists. Immediate repair required to prevent accidents and property damage.',
    imageUrl: '/UPGOV/civic-complaint-1.jpg',
    submittedAt: '2026-03-28T09:15:00.000Z',
    status: 'Verified On-Site',
    source: 'fallback',
  },
  {
    postId: 'demo-2',
    ticketId: 'GN-DEMO-002',
    citizenName: 'Rajesh Kumar',
    location: 'Market Area, Block B',
    category: 'Sanitation & Waste',
    description: 'Overflowing garbage bins causing health hazards and foul odor. Waste management pickup is overdue. Attracting pests and affecting public health in commercial zone.',
    imageUrl: '/UPGOV/civic-complaint-2.jpg',
    submittedAt: '2026-03-28T08:45:00.000Z',
    status: 'Verified On-Site',
    source: 'fallback',
  },
  {
    postId: 'demo-3',
    ticketId: 'GN-DEMO-003',
    citizenName: 'Priya Singh',
    location: 'Knowledge Park II',
    category: 'Public Lighting',
    description: 'Streetlights remain inactive on internal road stretch after 7 PM. Visibility is low for commuters with safety concerns at night.',
    imageUrl: '/UPGOV/civic-complaint-3.jpg',
    submittedAt: '2026-03-28T10:30:00.000Z',
    status: 'Assigned',
    source: 'fallback',
  },
];

function loadFeedInteractions() {
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveFeedInteractions(interactions) {
  localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(interactions));
}

function normalizeText(value) {
  return String(value || '').trim();
}

function sanitizeComment(input) {
  const clipped = normalizeText(input).slice(0, MAX_COMMENT_LENGTH);
  // Basic client-side sanitizer to strip HTML-like tokens from user comments.
  return clipped.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function isPotentialAbuse(commentText) {
  // Placeholder moderation hook for future policy modules/services.
  const blockedTerms = ['spam-link', 'abuse-placeholder'];
  const lower = commentText.toLowerCase();
  return blockedTerms.some(term => lower.includes(term));
}

function formatDateLabel(dateValue) {
  if (!dateValue) return 'Recently submitted';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently submitted';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function makePlaceholderImage(post) {
  const title = (post.category || 'Civic Issue').slice(0, 36);
  const subtitle = `${post.location || 'City Zone'} | ${post.ticketId || 'GN-000000'}`.slice(0, 54);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="Complaint placeholder image">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1b355f"/>
      <stop offset="100%" stop-color="#2f456f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="720" fill="url(#g)"/>
  <rect x="70" y="78" width="1060" height="564" rx="28" fill="#ffffff" opacity="0.06"/>
  <text x="100" y="328" fill="#e7eef8" font-size="58" font-family="Source Sans 3, Arial, sans-serif" font-weight="700">Citizen Visual Evidence</text>
  <text x="100" y="395" fill="#b9c8df" font-size="34" font-family="Source Sans 3, Arial, sans-serif">${title}</text>
  <text x="100" y="450" fill="#8ea5c8" font-size="28" font-family="Source Sans 3, Arial, sans-serif">${subtitle}</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getDistanceSeed(postId) {
  const hash = String(postId)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 7) + 1;
}

function buildPostsFromTickets(tickets) {
  const posts = [];

  tickets.forEach(ticket => {
    const mediaItems = Array.isArray(ticket.mediaEvidence) ? ticket.mediaEvidence : [];
    mediaItems.forEach((media, index) => {
      const imageUrl = media?.previewUrl || media?.url || '';
      if (!imageUrl) return;
      const postId = `${ticket.ticketId || 'ticket'}-${media.id || index}`;
      posts.push({
        postId,
        ticketId: ticket.ticketId || 'GN-UNKNOWN',
        citizenName: ticket.citizenName || ticket.name || 'Citizen Reporter',
        location: ticket.location || ticket.sector || 'Location pending verification',
        category: ticket.category || 'Other',
        description: ticket.description || 'Complaint details submitted for review.',
        imageUrl,
        fallbackImageUrl: makePlaceholderImage({
          category: ticket.category,
          location: ticket.location || ticket.sector,
          ticketId: ticket.ticketId,
        }),
        submittedAt: ticket.filedAt || ticket.date || new Date().toISOString(),
        status: ticket.status || 'Filed',
        source: 'citizen-media',
      });
    });
  });

  return posts;
}

export default function CommunityReels({ onClose }) {
  const [interactions, setInteractions] = useState(() => loadFeedInteractions());
  const [commentDrafts, setCommentDrafts] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [sortMode, setSortMode] = useState('most-supported');

  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const posts = useMemo(() => {
    const derived = buildPostsFromTickets(getInitialTickets());
    const base = derived.length > 0 ? derived : FALLBACK_POSTS.map(post => ({
      ...post,
      imageUrl: makePlaceholderImage(post),
      fallbackImageUrl: makePlaceholderImage(post),
    }));

    const withMetrics = base.map(post => {
      const current = interactions[post.postId] || { liked: false, comments: [] };
      const comments = Array.isArray(current.comments) ? current.comments : [];
      const likesFromComments = comments.length * 2;
      const baseLikes = post.source === 'citizen-media' ? 6 : 10;
      const likeCount = baseLikes + likesFromComments + (current.liked ? 1 : 0);
      const nearSeed = getDistanceSeed(post.postId);
      return {
        ...post,
        liked: Boolean(current.liked),
        comments,
        likeCount,
        nearScore: nearSeed,
        imageUrl: post.imageUrl || post.fallbackImageUrl || makePlaceholderImage(post),
        fallbackImageUrl: post.fallbackImageUrl || makePlaceholderImage(post),
      };
    });

    if (sortMode === 'newest') {
      return [...withMetrics].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    }

    if (sortMode === 'near-you') {
      return [...withMetrics].sort((a, b) => a.nearScore - b.nearScore);
    }

    return [...withMetrics].sort((a, b) => b.likeCount - a.likeCount);
  }, [interactions, sortMode]);

  const updatePostInteraction = (postId, updater) => {
    setInteractions(current => {
      const existing = current[postId] || { liked: false, comments: [] };
      const next = updater(existing);
      const updated = {
        ...current,
        [postId]: next,
      };
      saveFeedInteractions(updated);
      return updated;
    });
  };

  const handleToggleLike = postId => {
    updatePostInteraction(postId, existing => ({
      ...existing,
      liked: !existing.liked,
    }));
  };

  const handleAddComment = postId => {
    const draft = commentDrafts[postId] || '';
    const sanitized = sanitizeComment(draft);
    if (!sanitized) return;
    if (isPotentialAbuse(sanitized)) return;

    const nextComment = {
      id: `c-${Date.now()}`,
      text: sanitized,
      author: 'Citizen',
      createdAt: new Date().toISOString(),
    };

    updatePostInteraction(postId, existing => {
      const comments = Array.isArray(existing.comments) ? existing.comments : [];
      return {
        ...existing,
        comments: [nextComment, ...comments].slice(0, 20),
      };
    });

    setCommentDrafts(current => ({
      ...current,
      [postId]: '',
    }));
  };

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              aria-label="Close feed"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-900"
              onClick={onClose}
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-gray-900 font-bold text-lg">Citizen Feed</h1>
          </div>
          <button
            aria-label="Close feed"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-900"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Feed Container */}
      <div className="pt-16 pb-8 max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh] text-center">
            <div>
              <p className="text-gray-600 text-lg">No posts yet</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for civic complaints</p>
            </div>
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.postId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.1, 0.4), duration: 0.4 }}
              className="mb-8"
            >
              {/* Post Card */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                {/* Profile Header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {post.citizenName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold text-sm">{post.citizenName}</p>
                      <p className="text-gray-500 text-xs">{post.location}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition" type="button">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Image Container */}
                <div className="relative bg-gray-100 aspect-square overflow-hidden">
                  <img
                    alt={post.ticketId}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setImageErrors(current => ({ ...current, [post.postId]: true }))}
                    src={imageErrors[post.postId] ? post.fallbackImageUrl : post.imageUrl}
                  />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="rounded-full bg-blue-500/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
                      {post.category}
                    </span>
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide shadow-md ${
                      post.status === 'Verified On-Site' 
                        ? 'bg-emerald-500/95 text-white' 
                        : 'bg-amber-500/95 text-white'
                    }`}>
                      {post.status === 'Verified On-Site' ? '✓ Verified' : post.status}
                    </span>
                  </div>

                  {/* Right Sidebar Interactions */}
                  <div className="absolute right-4 bottom-16 flex flex-col gap-4">
                    {/* Like Button */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleToggleLike(post.postId)}
                      className="flex flex-col items-center gap-1 group"
                      type="button"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition ${
                        post.liked 
                          ? 'bg-rose-100' 
                          : 'bg-white/80 group-hover:bg-gray-100 shadow-md'
                      }`}>
                        <Heart className={`h-5 w-5 ${post.liked ? 'fill-rose-500 text-rose-500' : 'text-gray-900'}`} />
                      </div>
                      <span className="text-gray-800 text-[11px] font-semibold">{post.likeCount}</span>
                    </motion.button>

                    {/* Comment Button */}
                    <button className="flex flex-col items-center gap-1 group" type="button">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/80 group-hover:bg-gray-100 transition shadow-md">
                        <MessageCircle className="h-5 w-5 text-gray-900" />
                      </div>
                      <span className="text-gray-800 text-[11px] font-semibold">{post.comments.length}</span>
                    </button>

                    {/* Share Button */}
                    <button className="flex flex-col items-center gap-1 group" type="button">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/80 group-hover:bg-gray-100 transition shadow-md">
                        <Share2 className="h-5 w-5 text-gray-900" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Caption Section */}
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <p className="text-gray-900 text-[13px] leading-relaxed font-medium">{post.description}</p>
                    <p className="text-gray-500 text-xs mt-2 font-medium">{formatDateLabel(post.submittedAt)}</p>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-2 py-2 border-t border-gray-100">
                    {post.comments.length === 0 ? (
                      <p className="text-gray-400 text-xs">No comments yet</p>
                    ) : (
                      post.comments.slice(0, MAX_VISIBLE_COMMENTS).map(comment => (
                        <div key={comment.id} className="text-xs">
                          <span className="text-gray-900 font-semibold">{comment.author}</span>
                          <span className="text-gray-600 ml-2">{comment.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <input
                      aria-label={`Comment on ${post.ticketId}`}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      maxLength={MAX_COMMENT_LENGTH}
                      onChange={event =>
                        setCommentDrafts(current => ({
                          ...current,
                          [post.postId]: event.target.value,
                        }))
                      }
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleAddComment(post.postId);
                        }
                      }}
                      placeholder="Add a comment..."
                      value={commentDrafts[post.postId] || ''}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Post comment for ${post.ticketId}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition"
                      onClick={() => handleAddComment(post.postId)}
                      type="button"
                    >
                      Post
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
