
package com.career.skillanalyzer.DTO;

import java.util.List;

public class SkillBundleDTO {
    private List<String> strong;
    private List<String> weak;
    private List<String> missing;

    public List<String> getStrong() { return strong; }
    public void setStrong(List<String> strong) { this.strong = strong; }
    public List<String> getWeak() { return weak; }
    public void setWeak(List<String> weak) { this.weak = weak; }
    public List<String> getMissing() { return missing; }
    public void setMissing(List<String> missing) { this.missing = missing; }
}
