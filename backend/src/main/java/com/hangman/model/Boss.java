package com.hangman.model;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Boss extends GameCharacter {

    private final String cat;
    private final int lo;
    private final int hi;

    private final int hp;
    private final int maxHP;
    private final int timeLimit;

    private final List<String> introLines;

    private final String clue;
    private final String free;
    private final String done;

    public Boss(
        String name,
        int x,
        Integer fy,
        String cat,
        int lo,
        int hi,
        NPCAppearance pal,
        int hp,
        int maxHP,
        int timeLimit,
        List<String> introLines,
        String clue,
        String free,
        String done
    ) {
        super(name, x, fy, pal);

        this.cat = cat;
        this.lo = lo;
        this.hi = hi;
        this.hp = hp;
        this.maxHP = maxHP;
        this.timeLimit = timeLimit;

        this.introLines = introLines == null
            ? List.of()
            : List.copyOf(introLines);

        this.clue = clue;
        this.free = free;
        this.done = done;
    }

    public String getCat() {
        return cat;
    }

    public int getLo() {
        return lo;
    }

    public int getHi() {
        return hi;
    }

    public int getHp() {
        return hp;
    }

    public int getMaxHP() {
        return maxHP;
    }

    public int getTimeLimit() {
        return timeLimit;
    }

    public List<String> getIntroLines() {
        return introLines;
    }

    public String getClue() {
        return clue;
    }

    public String getFree() {
        return free;
    }

    public String getDone() {
        return done;
    }

    @Override
    @JsonIgnore
    public String getIntroduction() {
        return introLines.isEmpty() ? "" : introLines.get(0);
    }
}