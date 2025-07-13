// lib/auth-utils.ts
import { NextRequest } from 'next/server';
import { LoginLog } from '@/models/LoginLog';
import dbConnect from '@/lib/mongoose';

// Helper function to get client IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// Helper function to parse user agent for device info
export function parseUserAgent(userAgent: string): string {
  if (!userAgent) return 'Unknown Device';
  
  const ua = userAgent.toLowerCase();
  
  // Operating System detection
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Device type detection
  let deviceType = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android')) deviceType = 'Mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'Tablet';
  
  // Return formatted device string
  return `${os} - ${browser} (${deviceType})`;
}

// Function to log login activity
export async function logLoginActivity(
  email: string,
  userId: string,
  provider: string,
  request?: NextRequest
) {
  try {
    await dbConnect();
    
    let ipAddress = 'unknown';
    let deviceString = 'Unknown Device';
    
    if (request) {
      ipAddress = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';
      deviceString = parseUserAgent(userAgent);
    }
    
    await LoginLog.create({
      email,
      userId,
      provider,
      ip: ipAddress,
      device: deviceString
    });
  } catch (error) {
    console.error("Failed to log login:", error);
  }
}