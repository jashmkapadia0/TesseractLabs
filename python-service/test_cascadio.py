import cascadio
import os

print(f"Cascadio version: {cascadio.__version__}")

try:
    # Try one arg
    print("Testing 1 arg...")
    res = cascadio.step_to_glb("nonexistent.step")
    print(f"1 arg result type: {type(res)}")
except TypeError as te:
    print(f"1 arg TypeError: {te}")
except Exception as e:
    print(f"1 arg Error: {e}")

try:
    # Try two args
    print("\nTesting 2 args...")
    res = cascadio.step_to_glb("nonexistent.step", "nonexistent.glb")
    print(f"2 args result type: {type(res)}")
except TypeError as te:
    print(f"2 args TypeError: {te}")
except Exception as e:
    print(f"2 args Error: {e}")
