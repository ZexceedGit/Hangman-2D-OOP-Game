package com.hangman.service;
import com.hangman.model.GameCharacter;
import java.util.ArrayList;
import com.hangman.model.NPC;
import com.hangman.model.NPCAppearance;
import com.hangman.model.QuestItem;
import com.hangman.model.GameData;
import org.springframework.stereotype.Service;
import com.hangman.model.Boss;

import java.util.List;

@Service
public class GameDataService {

    public GameDataService() {
    validateCharacterIntroductions();
}

private void validateCharacterIntroductions() {
    List<GameCharacter> characters = new ArrayList<>(NPCS);
    characters.add(BOSS);

    for (GameCharacter character : characters) {
        String introduction = character.getIntroduction();

        if (introduction == null || introduction.isBlank()) {
            throw new IllegalStateException(
                "Missing introduction for: " + character.getName()
            );
        }
    }
}

    private static final int GROUND_Y = 370;

    private static final List<NPC> NPCS = List.of(

        new NPC(
            "Pip",
            600,
            null,
            List.of(),
            "pocket-knife",
            "Animal",
            5,
            6,
            new NPCAppearance("#f1c08a", "#5fe0b0", "#7a5230", "spiky", "#5a3418", null),
            "Unleash Biscuit the dog",
            "Biscuit is loose! Woof!",
            "The knot tightened… −1 heart",
            70,
            GROUND_Y - 30,
            "Oh no! Biscuit's leash is caught in a nasty knot. Can you help me free this little troublemaker?",
            null,
            null,
            "Biscuit is free! I found this Pocket Knife near the post. Take it, you might need it!"
        ),

        new NPC(
            "Granny Mae",
            1040,
            null,
            List.of("brass-key"),
            "bait-recipe",
            "Place",
            6,
            7,
            new NPCAppearance("#ffd3a1", "#d98ad1", "#6b4fa0", "bun", "#eeeeee", "glasses"),
            "Open Polly the parrot's cage",
            "Polly is flying free!",
            "The lock stayed shut… −1 heart",
            70,
            GROUND_Y - 70,
            "Oh dear! Polly is trapped in her cage, and I've lost the spare key! How will I get her out?",
            "I need a spare Brass Key to open it. Farmer Joe found an old one in his field. Could you ask him, sweetie?",
            "You found the Brass Key! Wonderful! Let's get Polly out of there!",
            "Polly is free! Here, take my Bait Recipe. It helped my husband catch some rare fish!"
        ),

        new NPC(
            "Sal",
            1540,
            344,
            List.of("machine-oil"),
            "old-compass",
            "Food",
            7,
            9,
            new NPCAppearance("#e8b07a", "#ffffff", "#2a45c9", "cap", "#ff9ac1", "stache"),
            "Lower the Mega Swirl lollipop",
            "The Mega Swirl is back on the counter!",
            "The rope held… −1 heart",
            40,
            GROUND_Y - 66,
            "My Mega Swirl is stuck up there! The pulley is jammed, and I can't bring it down!",
            "The pulley needs Machine Oil to loosen up. Zara might have some in her workshop. Could you get it for me?",
            "Machine Oil! Perfect! Let's get that Mega Swirl down!",
            "My Mega Swirl is back! Take this Old Compass. It helped me navigate when I was a sailor!"
        ),

        new NPC(
            "Bruno",
            2230,
            null,
            List.of("bee-smoker"),
            "iron-gear",
            "Animal",
            8,
            9,
            new NPCAppearance("#8a5a35", "#a8703d", "#6e4526", "ears", "#6e4526", null),
            "Get the honey jar down",
            "The honey jar is down! The bees are thrilled.",
            "The jar didn't budge… −1 heart",
            50,
            GROUND_Y - 30,
            "Grr! My honey jar is stuck in that tree, and angry bees are guarding it. I can't get near!",
            "A Bee Smoker would calm the swarm long enough to retrieve my honey. Finn might have one. Could you ask him?",
            "Grr! A Bee Smoker! Now those bees won't bother me. Let's get that honey!",
            "Honey secured! Take this spare Iron Gear from my broken extractor. Rex-9 might need it!"
        ),

        new NPC(
            "Rex-9",
            2910,
            null,
            List.of("iron-gear"),
            "power-cell",
            "Arcade",
            8,
            10,
            new NPCAppearance("#b8c4d6", "#5b6b8a", "#3a4560", "robot", "#ff6f7d", null),
            "Reboot robot pal Bit",
            "Bit is online and dancing!",
            "Reboot failed… −1 heart",
            70,
            GROUND_Y - 30,
            "BEEP. My friend Bit has stopped working! His motor is damaged, and I cannot repair it without a replacement part.",
            "BEEP. Bit needs an Iron Gear for repairs. Bruno may have a spare from his honey extractor. Please retrieve one.",
            "BEEP. Iron Gear detected! Repairs can begin. Let's get Bit running again!",
            "BEEP. Bit is back online! Take this charged Power Cell. It might power the old town gate!"
        ),

        new NPC(
            "Finn",
            3560,
            null,
            List.of("bait-recipe", "old-compass"),
            "bee-smoker",
            "Sea",
            6,
            8,
            new NPCAppearance("#e8b07a", "#2a9bd1", "#3a4560", "fisher", "#ffd23c", "beard"),
            "Reel in the Golden Fish",
            "The Golden Fish is on the dock!",
            "The line snapped… −1 heart",
            70,
            GROUND_Y - 30,
            "Ahoy! A giant fish has taken my fishing line! I think it's the legendary Golden Fish, but I need a way to track and lure it!",
            "I'll need a Bait Recipe from Granny Mae and an Old Compass from Sal to catch it. Could you collect both?",
            "You've got both! Excellent! Let's prepare the bait and track down that Golden Fish!",
            "What a catch! I also found this Bee Smoker in the supply crate. Bruno could use it!"
        ),

        new NPC(
            "Zara",
            4180,
            null,
            List.of("pocket-knife"),
            "machine-oil",
            "Magic",
            6,
            9,
            new NPCAppearance("#ffd3a1", "#6b3fb0", "#3b2470", "wizard", "#6b3fb0", "beard"),
            "Wake the sleeping cauldron",
            "The cauldron is bubbling happily!",
            "The spell fizzled… −1 heart",
            70,
            GROUND_Y - 30,
            "My cauldron has gone cold! Dried roots are blocking its air vent, and I can't clear them by hand!",
            "A Pocket Knife could clear the roots blocking my cauldron's air vent. Pip might have one. Could you bring it here?",
            "A Pocket Knife! Perfect! Let's clear this vent and get the cauldron burning again!",
            "The cauldron is working again! Take this Machine Oil. It should help someone repair an old mechanism!"
        ),

        new NPC(
            "Farmer Joe",
            4820,
            null,
            List.of("pocket-knife"),
            "brass-key",
            "Farm",
            6,
            9,
            new NPCAppearance("#e8b07a", "#c9394a", "#2a45c9", "straw", "#f2d27a", null),
            "Free the Giant Pumpkin",
            "The Giant Pumpkin rolled free!",
            "The vines held tight… −1 heart",
            70,
            GROUND_Y - 30,
            "Howdy! My prize pumpkin is trapped in some stubborn vines. I can't pull them apart!",
            "I need a Pocket Knife to cut through these stubborn vines. Pip might have one. Could you borrow it for me?",
            "Howdy! Just what I needed! Let's cut through those vines and free my prize pumpkin!",
            "Pumpkin's free! I found this old Brass Key buried near the vines. Maybe someone needs it!"
        )
    );

    private static final List<QuestItem> ITEMS = List.of(

        new QuestItem(
            "pocket-knife",
            "Pocket Knife",
            "🔪",
            "A small folding knife useful for cutting and clearing tangled materials."
        ),

        new QuestItem(
            "brass-key",
            "Brass Key",
            "🗝️",
            "An old spare key that fits Polly's cage lock."
        ),

        new QuestItem(
            "machine-oil",
            "Machine Oil",
            "🧴",
            "A small bottle of oil used to loosen stiff and rusty mechanisms."
        ),

        new QuestItem(
            "bait-recipe",
            "Bait Recipe",
            "📜",
            "A recipe for preparing bait that attracts rare fish."
        ),

        new QuestItem(
            "old-compass",
            "Old Compass",
            "🧭",
            "A working compass that helps sailors navigate unfamiliar waters."
        ),

        new QuestItem(
            "bee-smoker",
            "Bee Smoker",
            "🐝",
            "A beekeeper's tool that produces cool smoke to calm a swarm."
        ),

        new QuestItem(
            "iron-gear",
            "Iron Gear",
            "⚙️",
            "A spare metal gear salvaged from an old honey extractor."
        ),

        new QuestItem(
            "power-cell",
            "Power Cell",
            "🔋",
            "A fully charged energy cell capable of powering an old machine."
        )
    );

    private static final Boss BOSS = new Boss(
    "The Hangman King",
    5250,
    290,
    "Boss",
    5,
    8,
    new NPCAppearance(
        "#b8c9ff",
        "#30234b",
        "#171326",
        "coder",
        "#67e8f9",
        null
    ),
    5,
    5,
    50,
    List.of(
        "Wait... You're not one of them, are you?",
        "A real visitor... It's been so long since someone new came to this town.",
        "You see, this place wasn't always so quiet. Years ago, it was full of laughter, familiar faces, and people who always needed a little help.",
        "Then came the storm. It swallowed the town... and everyone in it.",
        "Everyone except me.",
        "I couldn't bear the silence. I couldn't accept that the people I loved were gone.",
        "So I found a way to bring them back. Their faces, their voices, their little habits... everything I could remember.",
        "But they were never truly brought back. They were only echoes, repeating the same days, the same requests, the same little troubles.",
        "Still, hearing their voices and seeing their familiar faces made me feel as though I had my home back.",
        "And then you arrived. You helped them in ways they never could before. For a moment, this town felt alive again.",
        "But watching you... made me realize something. I've kept this town trapped in the past for far too long.",
        "I told myself I was preserving their lives, but all I really did was prevent them from moving on.",
        "Perhaps this is fate. Perhaps you were meant to find this place... and bring this long tragedy to an end.",
        "There's only one way to break the spell. Its final magic is bound to five words.",
        "Solve them, and this town will finally be free. Everything I've recreated will fade, but perhaps that's how it was always meant to be.",
        "I have spent so long refusing to say goodbye. I think... I'm finally ready.",
        "Come, little hero. Help me end this."
    ),
    "The final word",
    "The Hangman King has fallen!",
    "You already defeated me..."
);

    public GameData getGameData() {
        return new GameData(NPCS, ITEMS, BOSS);
    }
}