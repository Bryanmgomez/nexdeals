package com.nexdeals.service;

import com.nexdeals.domain.*;
import com.nexdeals.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CommunityService {
    private final CommunityPostRepository postRepository;
    private final CommunityCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final StoreRepository storeRepository;

    public CommunityService(CommunityPostRepository postRepository, CommunityCommentRepository commentRepository,
                            UserRepository userRepository, GameRepository gameRepository, StoreRepository storeRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.storeRepository = storeRepository;
    }

    @Transactional
    public CommunityPost createPost(Long userId, Long gameId, Long storeId, String content,
                                    java.math.BigDecimal price, String currency) {
        User user = userRepository.findById(userId).orElseThrow();
        CommunityPost post = CommunityPost.builder().user(user).content(content)
                .reportedPrice(price).reportedCurrency(currency).build();
        if (gameId != null) post.setGame(gameRepository.findById(gameId).orElse(null));
        if (storeId != null) post.setStore(storeRepository.findById(storeId).orElse(null));
        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public Page<CommunityPost> list(int page, int size) {
        return postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Transactional
    public CommunityComment addComment(Long postId, Long userId, String content) {
        CommunityPost post = postRepository.findById(postId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();
        CommunityComment c = CommunityComment.builder().post(post).user(user).content(content).build();
        return commentRepository.save(c);
    }

    @Transactional
    public void moderate(Long postId, boolean approved) {
        postRepository.findById(postId).ifPresent(p -> { p.setModerated(true); postRepository.save(p); });
    }
}