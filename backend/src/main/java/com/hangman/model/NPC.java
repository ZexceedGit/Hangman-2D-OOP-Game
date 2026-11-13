package com.hangman.model;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class NPC extends GameCharacter {

    private final List<String> requiresItems;
    private final String rewardItem;

    private final String cat;
    private final int lo;
    private final int hi;

    private final String goal;
    private final String free;
    private final String fail;

    private final int bx;
    private final int by;

    private final String intro;
    private final String lockedDialogue;
    private final String readyDialogue;
    private final String done;

    public NPC(
        String name,
        int x,
        Integer fy,
        List<String> requiresItems,
        String rewardItem,
        String cat,
        int lo,
        int hi,
        NPCAppearance pal,
        String goal,
        String free,
        String fail,
        int bx,
        int by,
        String intro,
        String lockedDialogue,
        String readyDialogue,
        String done
    ) {
        super(name, x, fy, pal);

        this.requiresItems = requiresItems == null
            ? List.of()
            : List.copyOf(requiresItems);

        this.rewardItem = rewardItem;
        this.cat = cat;
        this.lo = lo;
        this.hi = hi;
        this.goal = goal;
        this.free = free;
        this.fail = fail;
        this.bx = bx;
        this.by = by;
        this.intro = intro;
        this.lockedDialogue = lockedDialogue;
        this.readyDialogue = readyDialogue;
        this.done = done;
    }

    public List<String> getRequiresItems() {
        return requiresItems;
    }

    public String getRewardItem() {
        return rewardItem;
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

    public String getGoal() {
        return goal;
    }

    public String getFree() {
        return free;
    }

    public String getFail() {
        return fail;
    }

    public int getBx() {
        return bx;
    }

    public int getBy() {
        return by;
    }

    public String getIntro() {
        return intro;
    }

    public String getLockedDialogue() {
        return lockedDialogue;
    }

    public String getReadyDialogue() {
        return readyDialogue;
    }

    public String getDone() {
        return done;
    }

    @Override
    @JsonIgnore
    public String getIntroduction() {
        return intro;
    }
}