package backend.entity;

import lombok.Getter;

@Getter
public enum SocialProviderType {
    Naver("네이버"),
    GOOGLE("구글");

    private final String description;

    SocialProviderType(String description) {
        this.description = description;
    }
}
