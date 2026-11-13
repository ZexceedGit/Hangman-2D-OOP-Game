package com.hangman.model;

import java.util.List;

public record GameData(
    List<NPC> npcs,
    List<QuestItem> items,
    Boss boss
) {
    public GameData {
        npcs = List.copyOf(npcs);
        items = List.copyOf(items);
    }
}