package com.assisconnect.controller;

import com.assisconnect.service.BackupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/backup")
@CrossOrigin(origins = "*")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> backup() {
        return ResponseEntity.ok(backupService.gerarBackupCompleto());
    }

    @GetMapping("/resumo")
    public ResponseEntity<Map<String, Object>> resumo() {
        return ResponseEntity.ok(backupService.gerarResumo());
    }
}
