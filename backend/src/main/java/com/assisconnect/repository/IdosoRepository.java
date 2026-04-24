package com.assisconnect.repository;

import com.assisconnect.entity.Idoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface IdosoRepository extends JpaRepository<Idoso, Long> {

    @Query("SELECT COUNT(i) FROM Idoso i WHERE FUNCTION('YEAR', i.dataCriacao) = :ano AND FUNCTION('MONTH', i.dataCriacao) = :mes")
    int contarPorMesEAno(@Param("ano") int ano, @Param("mes") int mes);

    @Query("SELECT i FROM Idoso i WHERE MONTH(i.dataCriacao) = :mes AND YEAR(i.dataCriacao) = :ano")
    List<Idoso> findByMesEAnoCriacao(@Param("mes") int mes, @Param("ano") int ano);

    // Todos os idosos cadastrados ate o final de um mes/ano
    @Query("SELECT i FROM Idoso i WHERE i.dataCriacao <= :dataLimite")
    List<Idoso> findAllCriadosAte(@Param("dataLimite") LocalDate dataLimite);

    @Query("SELECT i FROM Idoso i WHERE SUBSTRING(i.dataNascimento, 6, 2) = :mes AND SUBSTRING(i.dataNascimento, 9, 2) = :dia")
    List<Idoso> findAniversariantes(@Param("dia") String dia, @Param("mes") String mes);

    @Query("SELECT i FROM Idoso i WHERE SUBSTRING(i.dataNascimento, 6, 2) = :mes")
    List<Idoso> findByMesAniversario(@Param("mes") String mes);
}
