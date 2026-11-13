package com.hangman.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record NPCAppearance(
    String s,
    String t,
    String p,
    String h,
    String c,
    String a
) {}