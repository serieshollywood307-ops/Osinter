-- Enums definition for strict state typing
CREATE TYPE user_role AS ENUM ('USER', 'INVESTIGATOR', 'ORG_ADMIN', 'MODERATOR', 'SUPER_ADMIN');
CREATE TYPE authorization_status AS ENUM ('PENDING', 'VERIFIED', 'REVOKED', 'EXPIRED');
CREATE TYPE scan_type AS ENUM ('EMAIL', 'PHONE', 'DOMAIN', 'USERNAME');
CREATE TYPE scan_status AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED');
CREATE TYPE risk_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    verified_domain VARCHAR(255) NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'ENTERPRISE_FREE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cases Table
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    authorization_status authorization_status NOT NULL DEFAULT 'PENDING',
    evidence_notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Scan Requests Table
CREATE TABLE scan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    scan_type scan_type NOT NULL,
    input_hash VARCHAR(64) NOT NULL, -- SHA-256 / HMAC of normalized input
    masked_input VARCHAR(255) NOT NULL, -- e.g., a***@domain.com
    status scan_status NOT NULL DEFAULT 'QUEUED',
    requested_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Findings Table
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scan_requests(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity risk_severity NOT NULL,
    confidence NUMERIC(3, 2) CHECK (confidence >= 0.00 AND confidence <= 1.00),
    redacted_value TEXT NOT NULL,
    remediation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Exposure Events Table
CREATE TABLE exposure_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scan_requests(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    breach_name VARCHAR(255) NOT NULL,
    breach_date DATE NOT NULL,
    exposed_categories TEXT[] NOT NULL, -- Array of affected data classes
    severity risk_severity NOT NULL,
    remediation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Events Table (Immutable Log Vault)
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    ip_hash VARCHAR(64) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Consents Table
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Indexing for performance and security lookups
CREATE INDEX idx_scan_requests_hash ON scan_requests(input_hash);
CREATE INDEX idx_scan_requests_user ON scan_requests(requested_by);
CREATE INDEX idx_audit_actor ON audit_events(actor_id);
CREATE INDEX idx_findings_scan ON findings(scan_id);
CREATE INDEX idx_exposure_scan ON exposure_events(scan_id);
