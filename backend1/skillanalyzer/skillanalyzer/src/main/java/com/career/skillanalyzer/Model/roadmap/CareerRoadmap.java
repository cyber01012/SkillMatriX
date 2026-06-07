package com.career.skillanalyzer.Model.roadmap;

import java.util.ArrayList;
import java.util.List;

/**
 * CareerRoadmap implements a custom Singly Linked List to represent a career
 * path.
 * A Linked List is used here to emphasize the sequential nature of a career
 * roadmap,
 * where each skill or milestone logically leads to the next.
 */
public class CareerRoadmap {
    private CareerNode head;
    private CareerNode tail;

    public CareerRoadmap() {
        this.head = null;
        this.tail = null;
    }

    /**
     * Adds a new node to the end of the roadmap.
     * Complexity: O(1) because we maintain a tail pointer.
     */
    public void addNode(String skillName, String status, String guidance, String resources, String strategicAction) {
        CareerNode newNode = new CareerNode(skillName, status, guidance, resources, strategicAction);
        if (head == null) {
            head = newNode;
            tail = newNode;
        } else {
            tail.setNext(newNode);
            tail = newNode;
        }
    }

    /**
     * Returns the head of the Linked List.
     */
    public CareerNode getHead() {
        return head;
    }

    /**
     * Converts the Linked List into a List for easy JSON sterilization,
     * while maintaining the sequential order.
     */
    public List<CareerNode> toList() {
        List<CareerNode> list = new ArrayList<>();
        CareerNode current = head;
        while (current != null) {
            list.add(current);
            current = current.getNext();
        }
        return list;
    }
}
