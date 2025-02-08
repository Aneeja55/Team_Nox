import axios from "axios";

export default async function isProtected() {
    try {
        const response = await axios.get('/api/auth/user/protected', {
            headers: {
                'Content-Type': 'application/json',
                "x-access-token": localStorage.getItem('token')
            }
        });

        return response.data.success ? true : false;
    } catch (error) {
        return false;
    }
}
