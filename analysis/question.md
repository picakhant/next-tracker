Which ISP is used the most?
Which ISP has the lowest average latency?
Which location experiences the highest latency?
How many users use VPN?
Wi-Fi vs Mobile Data usage?
At what hour is the internet used most?
Which routing region appears most frequently?
Which OS platform is most common?

| Graph                       | Insight               |
| --------------------------- | --------------------- |
| Provider Distribution       | ISP အသုံးများဆုံး     |
| Average Latency by Provider | ISP Performance ⭐    |
| Connection Type             | Wi-Fi vs Mobile       |
| VPN Usage                   | VPN %                 |
| Routing Region              | Region Distribution   |
| Location Zone               | Usage by Location     |
| Hourly Usage                | ဘယ်အချိန် အသုံးများလဲ |
| Latency Distribution        | Network Quality       |

Great Aster 👍 now your **Question 1 is finished**.

ဒီ code:

```python
connected_df = df[df["status"] == "Connected"]

provider_counts = connected_df["provider"].value_counts()

plt.figure(figsize=(8,5))

provider_counts.plot(kind="bar")

plt.title("Internet Service Provider Distribution (Connected Only)")
plt.xlabel("Provider")
plt.ylabel("Number of Records")

plt.xticks(rotation=0)

plt.show()
```

က ဖြေထားတာ:

> **Which ISP is used the most?**

Logic က:

```
Original Dataset
        |
        v
Filter only Connected users
        |
        v
Count each ISP
        |
        v
Bar Chart
        |
        v
Highest bar = Most used ISP
```

---

အခု နောက်တစ်ခုကို ဆက်သွားမယ်။

# Question 2:

## Which ISP has the lowest average latency?

ဒီ question က:

> ဘယ် ISP က internet response time အနည်းဆုံးလဲ?

ဖြေဖို့ `provider` နဲ့ `latency_ms` ကိုသုံးမယ်။

---

## Step 1: ISP အလိုက် average latency တွက်မယ်

ဒီ code run ပါ:

```python
avg_latency_provider = (
    df.groupby("provider")["latency_ms"]
    .mean()
    .sort_values()
)

avg_latency_provider
```

Output က ဒီလိုမျိုးထွက်မယ်:

```
provider
ISP_A    35.2
ISP_B    48.6
ISP_C    72.1
Name: latency_ms, dtype: float64
```

အဓိပ္ပါယ်:

- ISP_A → average latency 35.2 ms
- ISP_B → average latency 48.6 ms
- ISP_C → average latency 72.1 ms

**အနည်းဆုံးတန်ဖိုးရှိတဲ့ ISP = latency အကောင်းဆုံး ISP**

---

## Step 2: Visualization

Graph ဆွဲမယ်:

```python
plt.figure(figsize=(8,5))

avg_latency_provider.plot(kind="bar")

plt.title("Average Latency by ISP")
plt.xlabel("ISP Provider")
plt.ylabel("Average Latency (ms)")

plt.xticks(rotation=0)

plt.show()
```

Graph မှာ:

```
Latency(ms)

80 |        █
60 |    █   █
40 | █
20 |
   ----------------
     A   B   C
```

ဆိုရင် A က latency အနည်းဆုံး။

---

### ဒီ analysis မှာ သတိထားရမယ့်အချက်

Question 1 မှာ:

```python
status == Connected
```

သုံးခဲ့တယ်။

Question 2 မှာတော့ **အားလုံးသုံးလို့ရတယ်**။

ဘာကြောင့်လဲဆိုတော့ latency data က connection quality ကို measure လုပ်တာဖြစ်လို့။

ဒါပေမယ့် presentation မှာ consistency အတွက် Connected users ပဲသုံးချင်ရင်:

```python
avg_latency_provider = (
    connected_df.groupby("provider")["latency_ms"]
    .mean()
    .sort_values()
)
```

လို့လည်းရေးလို့ရတယ်။

ငါကတော့ **Connected users သုံးတာကို recommend လုပ်တယ်**။ Question 1 နဲ့ logic တူသွားမယ်။

---

အခု ဒီ Question 2 code run ပြီး output (ISP နဲ့ latency values) ပို့ပါ။ ပြီးရင် Question 3 (**Which location experiences the highest latency?**) ကို ဆက်လုပ်မယ်။
