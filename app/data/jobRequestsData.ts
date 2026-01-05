import { JobRequest } from '../components/worker/JobRequestCard';

// Dummy job requests for worker
export const DUMMY_JOB_REQUESTS: JobRequest[] = [
    {
        id: 'req_001',
        customerName: 'Rahul Sharma',
        customerPhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        serviceType: 'Plumbing',
        distance: 2.3,
        estimatedEarnings: 800,
        location: 'Koramangala',
        description: 'Kitchen sink is leaking. Need immediate repair.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    },
    {
        id: 'req_002',
        customerName: 'Priya Patel',
        customerPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        serviceType: 'Electrical Work',
        distance: 4.1,
        estimatedEarnings: 1200,
        location: 'Indiranagar',
        description: 'Fan installation in 2 rooms. Switch board repair needed.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    },
    {
        id: 'req_003',
        customerName: 'Amit Kumar',
        customerPhoto: 'https://randomuser.me/api/portraits/men/52.jpg',
        serviceType: 'Carpentry',
        distance: 1.8,
        estimatedEarnings: 1500,
        location: 'HSR Layout',
        description: 'Wardrobe door hinge repair and drawer installation.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    },
];

// Get today's job count
export const getTodayJobsCount = (): number => {
    // This would normally come from actual completed deals
    return 3;
};

// Get pending payouts
export const getPendingPayouts = (): number => {
    // This would come from actual payment data
    return 2400;
};
