package com.mvecm.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String defaultUrl;

    @Value("${spring.datasource.username}")
    private String defaultUsername;

    @Value("${spring.datasource.password}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        if (databaseUrl != null && !databaseUrl.trim().isEmpty()) {
            try {
                logger.info("Found DATABASE_URL environment variable from cloud provider, configuring DataSource...");
                URI dbUri = new URI(databaseUrl);

                String username = null;
                String password = null;
                if (dbUri.getUserInfo() != null) {
                    String[] userInfo = dbUri.getUserInfo().split(":");
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }

                String host = dbUri.getHost();
                int port = dbUri.getPort() != -1 ? dbUri.getPort() : 5432;
                String path = dbUri.getPath(); // includes leading '/'
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "mvecm_db";

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
                if (dbUri.getQuery() != null) {
                    jdbcUrl += "?" + dbUri.getQuery();
                }

                config.setJdbcUrl(jdbcUrl);
                if (username != null) config.setUsername(username);
                if (password != null) config.setPassword(password);
                logger.info("Configured JDBC URL: jdbc:postgresql://{}:{}/{}", host, port, dbName);
                return new HikariDataSource(config);
            } catch (Exception e) {
                logger.warn("Could not parse DATABASE_URL as URI, using as-is or fallback. Error: {}", e.getMessage());
                if (!databaseUrl.startsWith("jdbc:")) {
                    databaseUrl = "jdbc:" + databaseUrl;
                }
                config.setJdbcUrl(databaseUrl);
                return new HikariDataSource(config);
            }
        }

        // Standard properties configuration (Local PC or explicit DB_HOST/DB_PORT/etc.)
        config.setJdbcUrl(defaultUrl);
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        return new HikariDataSource(config);
    }
}
