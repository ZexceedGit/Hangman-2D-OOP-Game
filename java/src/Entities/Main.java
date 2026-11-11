package java.src.Entities;

public class Main {
    public static void main(String[] args){
        pal custom1 = new pal("red", "black", "#ffc107", "#ff104", "#1f2457");
        String goal1  = "Release the Kraken from its a hundred thousand seal!";
        String free = "Yes you free the Kraken to leash destruction from this world!";
        String fail = "No you betray the prophecies that has been going for millenias!";
        String intro = "Hello Traveler!";
        String done = "thank you for sucesfing the mission!";
        NPC npc1 = new NPC("Cedrick", 600, "Animal", 5, 6, custom1, goal1, free, fail, 70, 370, intro, done );
        System.out.println(npc1.name);
    }
    
}

class NPC {
    String name, goal, free, fail, intro, done;
    pal custom;
    int x, lo, hi, bx, by;

    NPC(String name, int x, String cat, int lo, int hi, pal custom, String goal, String free, String fail, int bx, int by, String intro, String done){
        this.name = name;
        this.goal = goal;
        this.free = free;
        this.custom = custom;
        this.fail = fail;
        this.intro = intro;
        this.done = done;
        this.x = x;
        this.lo = lo;
        this.hi = hi;
        this.bx = bx;
        this.by = by;
    }
}
class pal {
    String s,t,p,h,c;

    pal(String s, String t, String p, String h, String c){
        this.s = s;
        this.t = t;
        this.p = p;
        this.h = h;
        this.c = c;
    }

}
