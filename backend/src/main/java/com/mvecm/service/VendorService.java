package com.mvecm.service;

import com.mvecm.dto.VendorRequest;
import com.mvecm.entity.Vendor;
import com.mvecm.exception.BadRequestException;
import com.mvecm.exception.ResourceNotFoundException;
import com.mvecm.repository.VendorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public List<Vendor> getAllVendors(boolean activeOnly) {
        if (activeOnly) {
            return vendorRepository.findByIsActiveTrue();
        }
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + id));
    }

    @Transactional
    public Vendor createVendor(VendorRequest req) {
        if (vendorRepository.existsByName(req.getName().trim())) {
            throw new BadRequestException("Vendor with this name already exists");
        }
        Vendor vendor = new Vendor();
        vendor.setName(req.getName().trim());
        vendor.setContactEmail(req.getContactEmail().trim());
        vendor.setContactPhone(req.getContactPhone());
        vendor.setDescription(req.getDescription());
        vendor.setLogoUrl(req.getLogoUrl());
        vendor.setActive(req.getIsActive() != null ? req.getIsActive() : true);
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor updateVendor(Long id, VendorRequest req) {
        Vendor vendor = getVendorById(id);
        String trimmedName = req.getName().trim();
        if (!vendor.getName().equalsIgnoreCase(trimmedName) && vendorRepository.existsByName(trimmedName)) {
            throw new BadRequestException("Vendor name already exists");
        }
        vendor.setName(trimmedName);
        vendor.setContactEmail(req.getContactEmail().trim());
        vendor.setContactPhone(req.getContactPhone());
        vendor.setDescription(req.getDescription());
        vendor.setLogoUrl(req.getLogoUrl());
        if (req.getIsActive() != null) {
            vendor.setActive(req.getIsActive());
        }
        return vendorRepository.save(vendor);
    }

    @Transactional
    public void deleteVendor(Long id) {
        Vendor vendor = getVendorById(id);
        vendorRepository.delete(vendor);
    }
}
