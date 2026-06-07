package com.career.skillanalyzer.Model.roadmap;

import lombok.Getter;
import lombok.Setter;

/**
 * CareerNode represents a single milestone or skill in the career roadmap.
 * In Data Structures terms, this is a Node in a Singly Linked List.
 */
@Getter
@Setter
public class CareerNode {
    private String skillName;
    private String status; // e.g., "STRONG", "WEAK", "MISSING", "MILESTONE"
    private String guidance;
    private String resources;
    private String strategicAction; // New: AI-generated strategic advice
    private CareerNode next; // Reference to the next node in the sequence

    public CareerNode(String skillName, String status, String guidance, String resources, String strategicAction) {
        this.skillName = skillName;
        this.status = status;
        this.guidance = guidance;
        this.resources = resources;
        this.strategicAction = strategicAction;
        this.next = null;
    }

    @Override
    public String toString() {
        return "CareerNode{" +
                "skillName='" + skillName + '\'' +
                ", status='" + status + '\'' +
                ", guidance='" + guidance + '\'' +
                '}';
    }
}
