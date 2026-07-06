package me.savindu.task_manager_backend.service.impl;

import lombok.RequiredArgsConstructor;
import me.savindu.task_manager_backend.common.code.ErrorCode;
import me.savindu.task_manager_backend.common.exception.BusinessException;
import me.savindu.task_manager_backend.constant.RoleCode;
import me.savindu.task_manager_backend.dto.LoginRequest;
import me.savindu.task_manager_backend.dto.RegisterRequest;
import me.savindu.task_manager_backend.mapper.UserMapper;
import me.savindu.task_manager_backend.model.Role;
import me.savindu.task_manager_backend.model.User;
import me.savindu.task_manager_backend.repository.RoleRepository;
import me.savindu.task_manager_backend.repository.UserRepository;
import me.savindu.task_manager_backend.security.AppUserDetails;
import me.savindu.task_manager_backend.security.JwtService;
import me.savindu.task_manager_backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResult register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS, email);
        }

        Role userRole = roleRepository.findByCode(RoleCode.USER)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_ROLE_NOT_FOUND, RoleCode.USER));

        User user = userMapper.toEntity(request, userRole, passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(new AppUserDetails(saved));

        return new AuthResult(token, userMapper.toResponse(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        AppUserDetails principal = (AppUserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return new AuthResult(token, userMapper.toResponse(principal.getUser()));
    }
}
