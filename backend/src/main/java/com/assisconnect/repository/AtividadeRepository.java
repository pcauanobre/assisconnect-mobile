package com.assisconnect.repository;

import com.assisconnect.entity.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AtividadeRepository extends JpaRepository<Atividade, Long> {

    List<Atividade> findByDataRegistro(String dataRegistro);
    List<Atividade> findByDataRegistroAndNome(String dataRegistro, String nome);

    @Query("SELECT DISTINCT a.dataRegistro FROM Atividade a " +
           "WHERE a.dataRegistro BETWEEN :inicio AND :fim")
    List<String> findDatasDistintasNoPeriodo(@Param("inicio") String inicio,
                                              @Param("fim") String fim);
}
