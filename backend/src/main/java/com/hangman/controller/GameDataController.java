package com.hangman.controller;

import com.hangman.model.GameData;
import com.hangman.service.GameDataService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GameDataController {

    private final GameDataService gameDataService;

    public GameDataController(GameDataService gameDataService) {
        this.gameDataService = gameDataService;
    }

    @GetMapping("/game-data")
    public GameData getGameData() {
        return gameDataService.getGameData();
    }
}