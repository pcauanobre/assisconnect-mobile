package com.assisconnect.repository;

import com.assisconnect.entity.RelatorioMensal;
import com.assisconnect.entity.Idoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RelatorioMensalRepository extends JpaRepository<RelatorioMensal, Long> {

    Optional<RelatorioMensal> findByMesAndAno(int mes, int ano);

    // Consulta para puxar os idosos cadastrados no mês/ano
    @Query("SELECT i FROM Idoso i WHERE MONTH(i.dataCriacao) = :mes AND YEAR(i.dataCriacao) = :ano")
    List<Idoso> findByMesEAnoCriacao(@Param("mes") int mes, @Param("ano") int ano);
}
