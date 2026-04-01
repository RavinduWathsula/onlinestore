<?php

declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_USER = 'root';
const DB_PASS = '';
const DB_NAME = 'novastore';
const DB_PORT = 3306;

const SMS_TWILIO_ACCOUNT_SID = '';
const SMS_TWILIO_AUTH_TOKEN = '';
const SMS_TWILIO_FROM = '';
const OTP_TTL_MINUTES = 5;

const ADMIN_PANEL_EMAIL = 'admin@neocart.lk';
const ADMIN_PANEL_PASSWORD = 'Admin@12345';

function config_env(string $key, string $fallback = ''): string
{
	$value = getenv($key);
	if ($value === false) {
		return $fallback;
	}

	return trim((string) $value);
}
