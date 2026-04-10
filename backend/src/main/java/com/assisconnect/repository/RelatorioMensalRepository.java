package com.assisconnect.repository;

import com.assisconnect.entity.RelatorioMensal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RelatorioMensalRepository extends JpaRepository<RelatorioMensal, Long> {

    Optional<RelatorioMensal> findByMesAndAno(int mes, int ano);

    List<RelatorioMensal> findByAnoOrderByMesAsc(int ano);
}
