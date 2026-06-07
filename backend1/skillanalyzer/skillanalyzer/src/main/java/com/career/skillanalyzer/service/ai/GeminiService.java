package com.career.skillanalyzer.service.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(@Value("${gemini.api-key}") String apiKey) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String generate(String prompt) {
        try {
            GenerateContentConfig config =
                    GenerateContentConfig.builder().build();

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            config
                    );

            if (response == null || response.text() == null) {
                throw new RuntimeException("Empty AI response");
            }

            return response.text().trim();

        } catch (Exception e) {
            throw new RuntimeException("Gemini AI failed: " + e.getMessage(), e);
        }
    }
}
