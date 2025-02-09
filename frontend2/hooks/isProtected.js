import apiUrl from "@/constants/apiUrl";
import axios from "axios";

export default async function isProtected() {
    try {
        if (!localStorage.getItem('token')) return false;
        const response = await axios.get(apiUrl+'/api/auth/user/protected', {
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
