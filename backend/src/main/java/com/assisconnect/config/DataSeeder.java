package com.assisconnect.config;

import com.assisconnect.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() == 0) {
            System.out.println("Banco de dados vazio. Rodando o script inicial (data.sql)...");
            try {
                EncodedResource encodedScript = new EncodedResource(new ClassPathResource("data.sql"), "UTF-8");
                ScriptUtils.executeSqlScript(dataSource.getConnection(), encodedScript);
                System.out.println("Carga de dados concluída com sucesso!");
            } catch (Exception e) {
                System.err.println("Erro ao rodar o data.sql: " + e.getMessage());
            }
        } else {
            System.out.println("Banco de dados já contém dados. Ignorando a carga inicial.");
        }
    }
}
