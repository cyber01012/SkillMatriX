package com.career.skillanalyzer.DTO;
import java.util.List;

/**
 * DTO returned to frontend
 * Matches Jobicy structure + matching info
 */
public class JobResponseDTO {

    // Jobicy fields
    private String id;
    private String url;
    private String jobTitle;
    private String companyName;
    private String companyLogo;
    private String jobIndustry;
    private String jobType;
    private String jobGeo;
    private String jobLevel;
    private String jobExcerpt;
    private String jobDescription;
    private String pubDate;

    private Integer salaryMin;
    private Integer salaryMax;
    private String salaryCurrency;
    private String salaryPeriod;

    // Matching info
    private int matchScore;
    private List<String> matchedSkills;
    private String recommendationType;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getJobIndustry() { return jobIndustry; }
    public void setJobIndustry(String jobIndustry) { this.jobIndustry = jobIndustry; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getJobGeo() { return jobGeo; }
    public void setJobGeo(String jobGeo) { this.jobGeo = jobGeo; }

    public String getJobLevel() { return jobLevel; }
    public void setJobLevel(String jobLevel) { this.jobLevel = jobLevel; }

    public String getJobExcerpt() { return jobExcerpt; }
    public void setJobExcerpt(String jobExcerpt) { this.jobExcerpt = jobExcerpt; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getPubDate() { return pubDate; }
    public void setPubDate(String pubDate) { this.pubDate = pubDate; }

    public Integer getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }

    public Integer getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }

    public String getSalaryCurrency() { return salaryCurrency; }
    public void setSalaryCurrency(String salaryCurrency) { this.salaryCurrency = salaryCurrency; }

    public String getSalaryPeriod() { return salaryPeriod; }
    public void setSalaryPeriod(String salaryPeriod) { this.salaryPeriod = salaryPeriod; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public String getRecommendationType() { return recommendationType; }
    public void setRecommendationType(String recommendationType) { this.recommendationType = recommendationType; }
}
