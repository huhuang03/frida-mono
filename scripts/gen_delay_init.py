# change mono comment color?
# I want refactor code to init delay available, but modify code is boring, so let's write a script to do this.
import sys
import os
import re

class Item:
    def __init__(self, var_name: str, content: str):
        self.var_name = var_name
        self.content = content

def main():
    root = sys.argv[1]

    for f in os.listdir(root):
        full_path = os.path.join(root, f)
        found = parse_single_file(full_path)

re_item = "export const ([^ ]*) = (.*)"

def gen_item(s: str):
    s = s.strip()
    m = re.search(re_item, s)
    # how to do this?
    if m:
        return Item(m.group(1), m.group(2))

def gen_code_by_items(items: [Item], basename: str) -> str:
    if len(items) == 0:
        return ""
    rst = ""
    for item in items:
        rst += f"let {item.var_name}: ExNativeFunction | null = null\n"
    rst += "\nexport function init" + basename + "() {\n"
    for item in items:
        rst += f"  {item.var_name} = {item.content}\n"
    rst += "}\n"
    rst += "\n"
    return rst

def parse_single_file(f_path):
    "return True if found item, False otherwise"
    if not os.path.isfile(f_path):
        return

    base_name = os.path.basename(f_path)
    base_name = base_name[0: base_name.index(".")]
    found_one = False
    rst = ""
    out = False
    items: [Item] = []
    entered = False
    with open(f_path) as f:
        for line in f:
            if not line.strip():
                rst += line
                continue
            item = gen_item(line)

            if not item:
                if len(items) > 0:
                    if entered:
                        raise Exception("Shoule can only parse item once. infile: " + base_name)
                    entered = True
                    # how to do this?
                    rst += gen_code_by_items(items, base_name)
                    items = []
                    if not line.strip():
                        continue
                rst += line
            else:
                items.append(item)
                found_one = True
    with open(f_path, 'w', newline='\n') as f:
        f.write(rst)
    return found_one

if __name__ == "__main__":
    main()
