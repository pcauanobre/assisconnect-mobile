package com.assisconnect.repository;

import com.assisconnect.entity.Visita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VisitaRepository extends JpaRepository<Visita, Long> {

    List<Visita> findByIdosoIdOrderByDataVisitaDesc(Long idosoId);

    Optional<Visita> findTop1ByIdosoIdOrderByDataVisitaDesc(Long idosoId);

    @Query("SELECT DISTINCT v.idosoId FROM Visita v WHERE v.dataVisita >= :dataLimite")
    List<Long> findIdososComVisitaRecente(@Param("dataLimite") LocalDate dataLimite);
}
