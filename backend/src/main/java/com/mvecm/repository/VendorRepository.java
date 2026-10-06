package com.mvecm.repository;

import com.mvecm.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByName(String name);
    boolean existsByName(String name);
    List<Vendor> findByIsActiveTrue();
}
