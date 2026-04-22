package com.assisconnect.repository;

import com.assisconnect.entity.RegistroSaude;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistroSaudeRepository extends JpaRepository<RegistroSaude, Long> {

    List<RegistroSaude> findByIdosoIdOrderByDataDesc(Long idosoId);

    Optional<RegistroSaude> findTop1ByIdosoIdOrderByDataDesc(Long idosoId);
}
