package com.mvecm.service;

import com.mvecm.dto.AddressRequest;
import com.mvecm.dto.UserProfileUpdateRequest;
import com.mvecm.entity.Address;
import com.mvecm.entity.User;
import com.mvecm.exception.BadRequestException;
import com.mvecm.exception.ResourceNotFoundException;
import com.mvecm.repository.AddressRepository;
import com.mvecm.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateProfile(User user, UserProfileUpdateRequest req) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + user.getId()));
        managedUser.setName(req.getName().trim());
        if (req.getPhone() != null) {
            managedUser.setPhone(req.getPhone().trim());
        }
        return userRepository.save(managedUser);
    }

    public List<Address> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
    }

    @Transactional
    public Address addAddress(User user, AddressRequest req) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + user.getId()));

        List<Address> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(managedUser.getId());
        boolean isFirst = existing.isEmpty();

        Address address = new Address();
        address.setUser(managedUser);
        address.setFullName(req.getFullName().trim());
        address.setPhoneNumber(req.getPhoneNumber().trim());
        address.setStreetAddress(req.getStreetAddress().trim());
        address.setCity(req.getCity().trim());
        address.setState(req.getState().trim());
        address.setPostalCode(req.getPostalCode().trim());
        if (req.getCountry() != null) {
            address.setCountry(req.getCountry().trim());
        }

        boolean makeDefault = isFirst || Boolean.TRUE.equals(req.getIsDefault());
        if (makeDefault) {
            for (Address a : existing) {
                if (a.isDefault()) {
                    a.setDefault(false);
                    addressRepository.save(a);
                }
            }
        }
        address.setDefault(makeDefault);

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this address");
        }

        addressRepository.delete(address);
    }

    // Admin methods
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User toggleBlockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setBlocked(!user.isBlocked());
        return userRepository.save(user);
    }
}
