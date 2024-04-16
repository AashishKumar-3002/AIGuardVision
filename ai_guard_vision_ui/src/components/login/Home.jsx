import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from '../../utils/supabase';
import style from "./login.module.css";
export default function Home() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tab, setTab] = useState(0);
    const [name, setName] = useState("");
    async function handleSignIn(e) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            navigate("/login?message=Could not authenticate user");
        } else {
            navigate("/dashboard",{state: {email,password}})
        }
    }
    async function handleSignUp(e) {
        e.preventDefault();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${origin}/auth/callback`,
            },
          });
        if (error) {
            navigate("/error");
        }
        setTab(0);
        setEmail("");
        setPassword("");
    }
    return (
        <>
            {tab === 0 ?
            <div className={style.loginContainer} >
                <form className={style.formContainer} onSubmit={(e) => { handleSignIn(e) }}>
                    <div>
                        <button
                            onClick=
                            {(e) => {
                                e.preventDefault()
                                setTab(0)
                            }}
                            className={tab === 0 ? style.active : style.inactive}>
                            Sign In
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setTab(1)
                            }}
                            className={tab === 1 ? style.active : style.inactive}>
                            Sign Up
                        </button>
                    </div>
                    <input type="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} value={email} required />
                    <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} value={password} required />
                    <input type="submit" value="Sign In" />
                </form>
            </div>
            :
            <div className={style.loginContainer} >
                <form className={style.formContainer} onSubmit={(e) => { handleSignUp(e) }}>
                    <div>
                        <button
                            onClick=
                            {(e) => {
                                e.preventDefault()
                                setTab(0)
                            }}
                            className={tab === 0 ? style.active : style.inactive}>
                            Sign In
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                setTab(1)
                            }}
                            className={tab === 1 ? style.active : style.inactive}>
                            Sign Up
                        </button>
                    </div>
                    <input type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} value={name} required />
                    <input type="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} value={email} required />
                    <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} value={password} required />
                    <input type="submit" value="Sign Up" />
                </form>
            </div>}
        </>
    )
}