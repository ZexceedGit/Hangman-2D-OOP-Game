package com.hangman.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class GameCharacter {

    private final String name;
    private final int x;
    private final Integer fy;
    private final NPCAppearance pal;

    protected GameCharacter(
        String name,
        int x,
        Integer fy,
        NPCAppearance pal
    ) {
        this.name = name;
        this.x = x;
        this.fy = fy;
        this.pal = pal;
    }

    public String getName() {
        return name;
    }

    public int getX() {
        return x;
    }

    public Integer getFy() {
        return fy;
    }

    public NPCAppearance getPal() {
        return pal;
    }

    @JsonIgnore
    public abstract String getIntroduction();
}