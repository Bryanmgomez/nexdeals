package com.nexdeals.repository;

import com.nexdeals.domain.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GameRepository extends JpaRepository<Game, Long> {
    Page<Game> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query("SELECT g FROM Game g WHERE " +
           "(:q IS NULL OR LOWER(g.title) LIKE LOWER(CONCAT('%',:q,'%'))) AND " +
           "(:genre IS NULL OR LOWER(g.genres) LIKE LOWER(CONCAT('%',:genre,'%'))) AND " +
           "(:developer IS NULL OR LOWER(g.developer) LIKE LOWER(CONCAT('%',:developer,'%')))")
    Page<Game> search(@Param("q") String q, @Param("genre") String genre,
                      @Param("developer") String developer, Pageable pageable);
}