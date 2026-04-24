package com.assisconnect.repository;

import com.assisconnect.entity.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    List<Medicamento> findByIdosoIdOrderByNomeAsc(Long idosoId);

    List<Medicamento> findByIdosoIdAndAtivoTrueOrderByNomeAsc(Long idosoId);
}
