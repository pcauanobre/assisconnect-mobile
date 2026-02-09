package com.assisconnect.repository;

import com.assisconnect.entity.Idoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IdosoRepository extends JpaRepository<Idoso, Long> {

    @Query("SELECT COUNT(i) FROM Idoso i WHERE FUNCTION('YEAR', i.dataCriacao) = :ano AND FUNCTION('MONTH', i.dataCriacao) = :mes")
    int contarPorMesEAno(@Param("ano") int ano, @Param("mes") int mes);

    @Query("SELECT i FROM Idoso i WHERE MONTH(i.dataCriacao) = :mes AND YEAR(i.dataCriacao) = :ano")
    List<Idoso> findByMesEAnoCriacao(@Param("mes") int mes, @Param("ano") int ano);

    @Query("SELECT i FROM Idoso i WHERE FUNCTION('DAY', FUNCTION('STR_TO_DATE', i.dataNascimento, '%Y-%m-%d')) = :dia AND FUNCTION('MONTH', FUNCTION('STR_TO_DATE', i.dataNascimento, '%Y-%m-%d')) = :mes")
    List<Idoso> findAniversariantes(@Param("dia") int dia, @Param("mes") int mes);

    // ✅ NOVO: Todos os aniversariantes do mês atual
    @Query("SELECT i FROM Idoso i WHERE FUNCTION('MONTH', FUNCTION('STR_TO_DATE', i.dataNascimento, '%Y-%m-%d')) = :mes")
    List<Idoso> findByMesAniversario(@Param("mes") int mes);
}
